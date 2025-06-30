def get_user_permissions(user):
    """Trả về danh sách quyền thực tế của người dùng (tên quyền)"""
    quyen_thuc_te = set()

    # Quyền từ vai trò
    if user.vaitro:
        quyen_thuc_te.update([p.TenQuyen for p in user.vaitro.permissions])

    # Quyền riêng bổ sung
    quyen_thuc_te.update([p.TenQuyen for p in user.permissions])

    return quyen_thuc_te
